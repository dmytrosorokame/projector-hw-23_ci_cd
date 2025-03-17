const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const fs = require("fs").promises;
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const ELASTICSEARCH_URL = "http://elasticsearch:9200";

const client = new Client({
  node: ELASTICSEARCH_URL,
  tls: {
    rejectUnauthorized: false,
  },
});

const INDEX_NAME = "words_autocomplete";

app.post("/elasticsearch", async (req, res) => {
  try {
    await client.indices.delete({
      index: INDEX_NAME,
      ignore_unavailable: true,
    });

    await client.indices.create({
      index: INDEX_NAME,
      body: {
        settings: {
          analysis: {
            filter: {
              autocomplete_filter: {
                type: "ngram",
                min_gram: 3,
                max_gram: 3,
              },
            },
            analyzer: {
              autocomplete_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "autocomplete_filter"],
              },
            },
          },
        },
        mappings: {
          properties: {
            word: {
              type: "text",
              analyzer: "autocomplete_analyzer",
            },
          },
        },
      },
    });

    const words = (await fs.readFile("words.txt", "utf-8")).split("\n");

    const body = words.flatMap((word) => [
      { index: { _index: INDEX_NAME } },
      { word: word.trim() },
    ]);

    await client.bulk({ body });

    res.json({ message: "Index created successfully" });
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({ error: "Failed to create index" });
  }
});

app.get("/autocomplete", async (req, res) => {
  try {
    const { query, size = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    let searchQuery;
    if (query.length <= 7) {
      searchQuery = {
        match: {
          word: {
            query,
          },
        },
      };
    } else {
      searchQuery = {
        match: {
          word: {
            query: query,
            minimum_should_match: "75%",
          },
        },
      };
    }

    const result = await client.search({
      index: INDEX_NAME,
      body: {
        query: searchQuery,
        size,
      },
    });

    const suggestions = result.hits.hits.map((hit) => hit._source.word);

    res.json({ suggestions });
  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

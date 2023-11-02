import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();

const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get("/api/notes", async (req, res) => {
  const notes = await prisma.note.findMany();

  res.json(notes);
});

app.post("/api/notes", async (req, res) => {
  const { title, content } = req.body;
  const date = new Date().toString();

  if (!title || !content) {
    return res.status(400).send("Title and content fields required!");
  }

  try {
    const note = await prisma.note.create({
      data: { date, title, content },
    });
    res.json(note);
  } catch (err) {
    res.status(500).send("Nope, somethings wrong");
  }
});

app.put("/api/notes/:id", async (req, res) => {
  const { title, content } = req.body;
  const id = parseInt(req.params.id);

  const date = new Date().toString();

  if (!title || !content) {
    return res.status(400).send("title and content fields required");
  }

  if (!id || isNaN(id)) {
    return res.status(400).send("ID must be a valid number");
  }

  try {
    const updatedNote = await prisma.note.update({
      where: { id },
      data: { date, title, content },
    });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).send("Nope, somethings wrong");
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id)) {
    return res.status(400).send("ID field required");
  }

  try {
    await prisma.note.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).send("Oops, something went wrong");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

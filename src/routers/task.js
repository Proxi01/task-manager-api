const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const Task = require("../models/task");

const router = new express.Router();

router.get("/tasks", auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    if (req.query.sortBy) {
      const [field, direction] = req.query.sortBy.split(":");
      sort[field] = direction === "desc" ? -1 : 1;
    }

    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit, 10),
          skip: parseInt(req.query.skip, 10),
          sort,
        },
      })
      .execPopulate();

    res.send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const isValidId = mongoose.Types.ObjectId.isValid(_id);
    if (!isValidId) return res.status(422).send("The id is wrong");

    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) return res.status(404).send("Task is not found");
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/tasks", auth, async (req, res) => {
  const newTask = new Task({ ...req.body, owner: req.user._id });

  try {
    const task = await newTask.save();
    res.send(task);
  } catch (e) {
    res.status(422).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const isValidId = mongoose.Types.ObjectId.isValid(_id);
  if (!isValidId) return res.status(422).send("The id is wrong");

  const requestedFields = Object.keys(req.body);
  const allovedFields = ["completed", "description"];
  const isValid = requestedFields.every((update) =>
    allovedFields.includes(update)
  );

  if (!isValid) return res.status(422).send("Invalid field ");

  try {
    const task = await Task.findOne({ _id, onwer: req.user._id });
    if (!task) return res.status(404).send("Task is not found");
    requestedFields.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/task/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const isValidId = mongoose.Types.ObjectId.isValid(_id);
    if (!isValidId) return res.status(422).send("The id is wrong");

    await Task.findOneAndDelete({ _id, owner: req.user._id });
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;

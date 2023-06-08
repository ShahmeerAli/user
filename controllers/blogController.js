const fs = require("fs");
const Blog = require("../models/blog");
const { BACKEND_SERVER_PATH } = require("../config/index");
const BlogDTO = require("../dto/blog");
const Joi = require("joi");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  async create(req, res, next) {
    //1. Validate input using Joi
    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      urlToImage: Joi.string().required(),
      publishedAt: Joi.string().required(),
      url: Joi.string().required(),
      author: Joi.string().required(),
      user: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = createBlogSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { title, description, urlToImage, publishedAt, url, author, user } =
      req.body;

    //3. Save blog in Db
    //Creating BACKEND_SERVER_PATH in env
    let newBlog;
    try {
      newBlog = new Blog({
        title,
        description,
        urlToImage,
        publishedAt,
        url,
        author,
        user,
      });
      const blogs = await Blog.findOne({ url: url });
      if (!blogs) {
        await newBlog.save();
      } else {
        return res.status(200).json({ message: "already added" });
      }
    } catch (error) {
      return next(error);
    }
    //4. Send reponse
    //creating BlogDTO

    const blogDto = new BlogDTO(newBlog);

    return res.status(201).json({ blog: blogDto });
  },
  async getAll(req, res, next) {
    //1. Get blogs from database
    //2. Send Response
    const getByIdSchema = Joi.object({
      userId: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = getByIdSchema.validate(req.params);

    if (error) {
      return next(error);
    }
    const { userId } = req.params;

    try {
      const blogs = await Blog.find({ user: userId });

      let blogsDto = [];
      for (let i = 0; i < blogs.length; i++) {
        const dto = new BlogDTO(blogs[i]);
        blogsDto.push(dto);
      }

      return res.status(200).json({ blog: blogsDto });
    } catch {
      return next(error);
    }
  },
  async getById(req, res, next) {
    //1. Validate id using Joi
    //2. Get Blog from database by id
    //3. Send Response

    const getByIdSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = getByIdSchema.validate(req.params);

    if (error) {
      return next(error);
    }
    const { id } = req.params;
    let blog;
    try {
      blog = await Blog.findOne({ _id: id });
    } catch (error) {
      return next(error);
    }
    const blogDto = new BlogDTO(blog);

    return res.status(200).json({ blog: blogDto });
  },
  async delete(req, res, next) {
    //1. Validate id using Joi
    //2. Delete Blog
    //3. Delete Comment

    const deleteBlogSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = deleteBlogSchema.validate(req.params);

    if (error) {
      return next(error);
    }

    const { id } = req.params;

    try {
      await Blog.deleteOne({ _id: id });
    } catch (error) {
      return next(error);
    }

    return res.status(200).json({ message: "Blog Deleted" });
  },
};

module.exports = blogController;

class BlogDTO {
  constructor(blog) {
    this.id = blog.id;
    this.title = blog.title;
    this.author = blog.author;
    this.url = blog.url;
    this.urlToImage = blog.urlToImage;
    this.description = blog.description;
    this.publishedAt = blog.publishedAt;
    this.user = blog.user;
  }
}

module.exports = BlogDTO;

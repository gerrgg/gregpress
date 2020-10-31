# gregpress

A personal blogging platform with main focus sharing information and presenting it in a easy-to-find format.

## Post

![Blogs Mockup](./img/gregpress-blogs.jpg)

A post will have a category, include some text/image/code and may be divided into chapters.

- Only the admin can create posts
- Posts can be commented on
- Posts will have a single category
- Posts will have one or more chapters

## Users

Users will interact with the blog site and will be divided between admin/non-admins

- Email (String)
- Name (String)
- Date (Date)
- passwordHash (String)
- resetToken (String)
- admin (Bool)

## Uploads

Uploads are the files (usually images) uploaded to the site and used in blogs.

- Filename (String, Unique)
- Date (Date)
- Type (String)
- User (Model)
- Alt (String)
- Caption
- Sizes
  - Full,
  - Large,
  - Medium,
  - Small,
  - Thumb

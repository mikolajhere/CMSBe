import { db } from "../db";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

interface UserInfoProps {
  id: number;
}

export const getPosts = (req: Request, res: Response) => {
  const q = req.query.cat
    ? "SELECT * FROM posts WHERE cat=?"
    : "SELECT * FROM posts";

  db.query(q, [req.query.cat], (err, data) => {
    if (err) return res.status(500).send(err);

    return res.status(200).json(data);
  });
};

export const getPost = (req: Request, res: Response) => {
  const q =
    "SELECT `username`, `uid`, `title`, `desc`, p.img, u.bio, u.image, `cat`, `date` FROM users u JOIN posts p ON u.id = p.uid WHERE p.id = ?";

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data[0]);
  });
};

export const addPost = (req: Request, res: Response) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  if (req.body.title === "" || null)
    return res.status(409).json("Title must be filled out");
  if (req.body.desc === "" || null)
    return res.status(409).json("Content must be filled out");
  if (req.body.cat === "" || null)
    return res.status(409).json("Category must be filled out");
  if (req.body.img === "" || null)
    return res.status(409).json("Image must be filled out");

  jwt.verify(token, "jwtkey", (err: Error, userInfo: UserInfoProps) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`, `uid`) VALUES (?)";
    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).send(err);
      return res.json("Post has been created.");
    });
  });
};

export const deletePost = (req: Request, res: Response) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err: Error, userInfo: UserInfoProps) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";

    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your post!");

      return res.json("Post has been deleted!");
    });
  });
};

export const updatePost = (req: Request, res: Response) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err: Error, userInfo: UserInfoProps) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;

    const query =
      "UPDATE `posts` SET  `title` = ?, `desc` = ?, `img` = ?, `cat` = ? WHERE `id` = ? AND `uid` = ?";

    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      postId,
      userInfo.id,
    ];

    db.query(query, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("Post has been updated.");
    });
  });
};

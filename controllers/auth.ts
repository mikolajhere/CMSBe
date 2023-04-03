import { db } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const register = (req: Request, res: Response) => {
  // check existed user
  const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username], (err, data) => {
    // check if form inputs empty
    if (req.body.username === "" || null)
      return res.status(409).json("Username must be filled out");
    if (req.body.email === "" || null)
      return res.status(409).json("Email address must be filled out");
    if (req.body.password === "" || null)
      return res.status(409).json("Password must be filled out");

    if (err) return res.json(err);
    if (data.length) return res.status(409).json("User already exist!");

    //hash the password and create a user

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = "INSERT INTO users(`username`, `email`, `password`) VALUES (?)";
    const values = [req.body.username, req.body.password, hash];

    db.query(q, [values], (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json("User has been created.");
    });
  });
};
export const login = (req: Request, res: Response) => {
  // check user
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    // check if inputs empty
    if (req.body.username === "" || null)
      return res.status(409).json("Username must be filled out");
    if (req.body.password === "" || null)
      return res.status(409).json("Password must be filled out");

    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    // check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );
    if (!isPasswordCorrect)
      return res.status(400).json("Wrong username or password!");

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  });
};
export const logout = (req: Request, res: Response) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User has been logged out.");
};

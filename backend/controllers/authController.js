import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Instantiate the database client
const prisma = new PrismaClient();

const DEFAULT_ACCESS_SECRET = 'temporary_development_access_secret_string_32_chars';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inboundEmail = req.body.email;
    const inboundPassword = req.body.password;

    if (!inboundEmail || !inboundPassword) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const preExistingUser = await prisma.user.findUnique({
      where: { email: inboundEmail }
    });

    if (preExistingUser) {
      return res.status(409).json({ error: 'A user account with that email already exists.' });
    }

    const passwordSaltRounds = 10;
    const encryptedPasswordString = await bcrypt.hash(inboundPassword, passwordSaltRounds);

    const newlyCreatedUserRecord = await prisma.user.create({
      data: {
        email: inboundEmail,
        password: encryptedPasswordString,
        role: 'USER'
      }
    });

    return res.status(201).json({
      id: newlyCreatedUserRecord.id,
      email: newlyCreatedUserRecord.email,
      role: newlyCreatedUserRecord.role
    });
  } catch (err) {
    return next(err);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inboundEmail = req.body.email;
    const inboundPassword = req.body.password;

    if (!inboundEmail || !inboundPassword) {
      return res.status(400).json({ error: 'Email and password fields must be populated.' });
    }

    const targetUserRecord = await prisma.user.findUnique({
      where: { email: inboundEmail }
    });

    if (!targetUserRecord) {
      return res.status(401).json({ error: 'Invalid authentication credentials.' });
    }

    const passwordMatchResult = await bcrypt.compare(inboundPassword, targetUserRecord.password);

    if (!passwordMatchResult) {
      return res.status(401).json({ error: 'Invalid authentication credentials.' });
    }

    const accessSigningKey = process.env.JWT_SECRET || DEFAULT_ACCESS_SECRET;

    const shortTermAccessToken = jwt.sign(
      { userId: targetUserRecord.id, role: targetUserRecord.role },
      accessSigningKey,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      accessToken: shortTermAccessToken,
      user: {
        id: targetUserRecord.id,
        email: targetUserRecord.email,
        role: targetUserRecord.role
      }
    });
  } catch (err) {
    return next(err);
  }
};

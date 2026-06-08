const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma
const prisma = new PrismaClient();

const DEFAULT_ACCESS_SECRET = 'temporary_development_access_secret_string_32_chars';

exports.registerUser = async (req, res, next) => {
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

    res.status(201).json({
      id: newlyCreatedUserRecord.id,
      email: newlyCreatedUserRecord.email,
      role: newlyCreatedUserRecord.role
    });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
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

    res.status(200).json({
      accessToken: shortTermAccessToken,
      user: {
        id: targetUserRecord.id,
        email: targetUserRecord.email,
        role: targetUserRecord.role
      }
    });
  } catch (err) {
    next(err);
  }
};

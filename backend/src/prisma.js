const { PrismaClient } = require('@prisma/client');

// A single shared Prisma client for the whole app. Creating many clients would
// open many DB connection pools, so we export one instance everywhere.
const prisma = new PrismaClient();

module.exports = { prisma };

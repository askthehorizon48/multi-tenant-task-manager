const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

router.post('/register', async (req, res) => {
  const { email, password, name, organizationName, organizationId } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let orgIdToUse;
    let role = 'MEMBER';

    if (organizationName) {
      // Create new organization and make user ADMIN
      const newOrg = await prisma.organization.create({
        data: { name: organizationName }
      });
      orgIdToUse = newOrg.id;
      role = 'ADMIN';
    } else if (organizationId) {
      // Join existing organization
      const existingOrg = await prisma.organization.findUnique({ where: { id: organizationId } });
      if (!existingOrg) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      orgIdToUse = organizationId;
    } else {
      return res.status(400).json({ error: 'Must provide either organizationName or organizationId' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        organizationId: orgIdToUse,
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

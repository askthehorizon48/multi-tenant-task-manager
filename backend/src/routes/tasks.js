const express = require('express');
const prisma = require('../prismaClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all task routes
router.use(authenticateToken);

// GET /tasks - Get all tasks for the user's organization
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { organizationId: req.user.organizationId }
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tasks/:id - Get specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { 
        id: req.params.id,
        organizationId: req.user.organizationId 
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /tasks - Create a new task
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title,
          description,
          status: status || 'TODO',
          organizationId: req.user.organizationId,
          createdById: req.user.id
        }
      });
      
      await tx.taskAudit.create({
        data: {
          taskId: task.id,
          action: 'CREATED',
          userId: req.user.id
        }
      });
      
      return task;
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /tasks/:id - Update a task
router.put('/:id', async (req, res) => {
  const { title, description, status } = req.body;
  
  try {
    // First, find the task within the organization
    const task = await prisma.task.findFirst({
      where: { 
        id: req.params.id,
        organizationId: req.user.organizationId 
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // RBAC Check
    if (req.user.role === 'MEMBER' && task.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own tasks' });
    }
    
    const result = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: task.id },
        data: {
          title: title !== undefined ? title : task.title,
          description: description !== undefined ? description : task.description,
          status: status !== undefined ? status : task.status
        }
      });
      
      await tx.taskAudit.create({
        data: {
          taskId: task.id,
          action: 'UPDATED',
          userId: req.user.id
        }
      });
      
      return updatedTask;
    });
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { 
        id: req.params.id,
        organizationId: req.user.organizationId 
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // RBAC Check
    if (req.user.role === 'MEMBER' && task.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own tasks' });
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.taskAudit.deleteMany({
        where: { taskId: task.id }
      });
      
      await tx.task.delete({
        where: { id: task.id }
      });
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

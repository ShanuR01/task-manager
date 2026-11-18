
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Task, TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  // LLM: Creates a new task and stores it in memory.
  create(createTaskDto: CreateTaskDto): Task {
    const newTask: Task = {
      id: randomUUID(),
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status ?? TaskStatus.TODO,
      dueDate: createTaskDto.dueDate,
      createdAt: new Date(),
    };

    this.tasks.push(newTask);

    return newTask;
  }

  // LLM: Returns all tasks currently stored in memory.
  findAll(): Task[] {
    return this.tasks;
  }

  // LLM: Finds a task by its ID or throws a 404 error.
  findOne(id: string): Task {
    const task = this.tasks.find((task) => task.id === id);

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  // LLM: Updates an existing task using the provided fields.
  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);

    Object.assign(task, updateTaskDto);

    return task;
  }

  // LLM: Deletes an existing task from memory.
  remove(id: string): void {
    const task = this.findOne(id);

    this.tasks = this.tasks.filter(
      (existingTask) => existingTask.id !== task.id,
    );
  }
}

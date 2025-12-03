// server/src/controllers/contactsController.ts
// Express controllers for contact CRUD operations.

import { Request, Response } from "express";
import contactsService from "../services/contactsService";

export async function create(req: Request, res: Response) {
  try {
    const contact = await contactsService.createContact(req.body);
    res.status(201).json(contact);
  } catch (err: any) {
    console.error("Create contact failed:", err);
    res.status(500).json({ error: "Failed to create contact" });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const contacts = await contactsService.listContacts();
    res.json(contacts);
  } catch (err: any) {
    console.error("List contacts failed:", err);
    res.status(500).json({ error: "Failed to list contacts" });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const contact = await contactsService.getContact(req.params.id);
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.json(contact);
  } catch (err: any) {
    console.error("Get contact failed:", err);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const updated = await contactsService.updateContact(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    console.error("Update contact failed:", err);
    res.status(500).json({ error: "Failed to update contact" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const ok = await contactsService.deleteContact(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Delete contact failed:", err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
}

export default {
  create,
  list,
  get,
  update,
  remove,
};

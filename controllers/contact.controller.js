import Contact from "../models/contact.model.js";

// GET all contacts
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err.message);
    res.status(500).send("Server error");
  }
};

// GET contact by ID
export const getContactById = async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (err) {
    console.error("Error fetching contact by ID:", err.message);
    res.status(500).send("Server error");
  }
};

// POST a new contact
export const postContact = async (req, res) => {
  try {
    const { name, email, phoneNumber, subject, address } = req.body;

    const newContact = new Contact({
      name,
      email,
      phoneNumber,
      subject,
      address,
    });

    await newContact.save();
    res
      .status(201)
      .json(newContact, { message: "Contact created successfully" });
  } catch (err) {
    console.error("Error posting new contact:", err.message);
    res.status(500).send("Server error");
  }
};

import mongoose from 'mongoose';

const conn = mongoose.connect('mongodb+srv://jamshaid:jamshaid@cluster0.aycmrpn.mongodb.net/new_node_structure')

export const db = conn;
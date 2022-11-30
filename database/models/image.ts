import mongoose, { Schema, model } from 'mongoose'

interface IImage {
    images: [];
    caption?: String;
    default?: Boolean;
    userId: String;
}

const imageSchema = new Schema<IImage>({
    images: { type: [], required: true },
    caption: { type: String, required: true },
    default: { type: Boolean, required: true, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
}, { timestamps: true });

const Images = model<IImage>('Image', imageSchema);
export default Images;
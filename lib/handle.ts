import * as dotenv from "dotenv";
import mongoose, { Connection, Schema, Model, Document } from "mongoose";

dotenv.config();

// Environment variable type checking
const dbURI: string = process.env.dbURI || "";
if (!dbURI) {
  throw new Error("MongoDB URI is required in environment variables");
}

// Interface for Item
interface IItem extends Document {
  name: string;
  cost: number;
}

// Schema definition
const itemSchema = new Schema<IItem>({
  name: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
});

// Connection management
let conn: Connection | null = null;

const waitDB = async (connection: Connection | null): Promise<Connection> => {
  if (connection === null) {
    try {
      const newConnection = await mongoose.createConnection(dbURI, {
        bufferCommands: false,
      });
      console.log("Database connection established");
      newConnection.model<IItem>("Item", itemSchema);
      return newConnection;
    } catch (error) {
      console.error("Database connection failed:", error);
      throw new Error("Database connection failed");
    }
  }
  return connection;
};

// Types for Lambda events and responses
interface APIGatewayEvent {
  body: string;
  pathParameters?: {
    id?: string;
  };
}

interface APIGatewayResponse {
  statusCode: number;
  body: string;
  headers?: {
    [key: string]: string;
  };
}

interface Context {
  callbackWaitsForEmptyEventLoop: boolean;
}

// Helper function for responses
const createResponse = (statusCode: number, body: any): APIGatewayResponse => {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};

// Lambda handlers
export const createItem = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayResponse> => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    conn = await waitDB(conn);
    const data = JSON.parse(event.body);

    const itemObject: Omit<IItem, keyof Document> = {
      name: data.name,
      cost: data.cost,
    };

    const ItemModel = conn.model<IItem>("Item");
    const newItem = await ItemModel.create(itemObject);

    return createResponse(200, { id: newItem._id });
  } catch (error) {
    console.error("Error creating item:", error);
    return createResponse(500, { message: "Internal Server error" });
  }
};

export const getItems = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayResponse> => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    conn = await waitDB(conn);
    const ItemModel = conn.model<IItem>("Item");
    const items = await ItemModel.find({});

    return createResponse(200, items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return createResponse(500, { message: "Internal Server error" });
  }
};

export const getItemById = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayResponse> => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    if (!event.pathParameters?.id) {
      return createResponse(400, { message: "Missing item ID" });
    }

    conn = await waitDB(conn);
    const ItemModel = conn.model<IItem>("Item");
    const _id = event.pathParameters.id;
    const item = await ItemModel.findById(_id);

    if (!item) {
      return createResponse(404, { message: "Item not found" });
    }

    return createResponse(200, item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return createResponse(500, { message: "Internal Server error" });
  }
};

export const deleteItem = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayResponse> => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    if (!event.pathParameters?.id) {
      return createResponse(400, { message: "Missing item ID" });
    }

    conn = await waitDB(conn);
    const ItemModel = conn.model<IItem>("Item");
    const _id = event.pathParameters.id;

    // Updated to use findByIdAndDelete instead of remove which is deprecated
    const deletedItem = await ItemModel.findByIdAndDelete(_id);

    if (!deletedItem) {
      return createResponse(404, { message: "Item not found" });
    }

    return createResponse(200, { message: "Item deleted" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return createResponse(500, { message: "Internal Server error" });
  }
};

export const updateItem = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayResponse> => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    if (!event.pathParameters?.id) {
      return createResponse(400, { message: "Missing item ID" });
    }

    conn = await waitDB(conn);
    const data = JSON.parse(event.body);

    const itemObject: Omit<IItem, keyof Document> = {
      name: data.name,
      cost: data.cost,
    };

    const ItemModel = conn.model<IItem>("Item");
    const _id = event.pathParameters.id;

    const updatedItem = await ItemModel.findByIdAndUpdate(_id, itemObject, {
      new: true,
    });

    if (!updatedItem) {
      return createResponse(404, { message: "Item not found" });
    }

    return createResponse(200, { message: "Item updated", item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return createResponse(500, { message: "Internal Server error" });
  }
};
export const closingPosts = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayResponse> => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    if (!event.pathParameters?.id) {
      return createResponse(400, { message: "Missing item ID" });
    }

    conn = await waitDB(conn);
    const data = JSON.parse(event.body);

    const itemObject: Omit<IItem, keyof Document> = {
      name: data.name,
      cost: data.cost,
    };

    const ItemModel = conn.model<IItem>("Item");
    const _id = event.pathParameters.id;

    const updatedItem = await ItemModel.findByIdAndUpdate(_id, itemObject, {
      new: true,
    });

    if (!updatedItem) {
      return createResponse(404, { message: "Item not found" });
    }

    return createResponse(200, { message: "Item updated", item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return createResponse(500, { message: "Internal Server error" });
  }
};

import { NextResponse } from "next/server";
import { db } from "@/utils/firebase-admin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'states' or 'sectors'

    if (!type || !["states", "sectors"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
    }

    const optionsRef = db.collection("options").doc(type);
    const doc = await optionsRef.get();

    if (!doc.exists) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: doc.data().items || [] });
  } catch (error) {
    console.error("Error fetching options:", error);
    return NextResponse.json(
      { error: "Failed to fetch options" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { type, value, label } = await request.json();

    if (!type || !["states", "sectors"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
    }

    if (!value || !label) {
      return NextResponse.json(
        { error: "Value and label are required" },
        { status: 400 }
      );
    }

    const optionsRef = db.collection("options").doc(type);
    const doc = await optionsRef.get();

    let items = [];
    if (doc.exists) {
      items = doc.data().items || [];
    }

    // Check if value already exists
    if (items.some((item) => item.value === value)) {
      return NextResponse.json(
        { error: "Option with this value already exists" },
        { status: 400 }
      );
    }

    const newItem = { value, label };
    items.push(newItem);

    await optionsRef.set({ items });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    console.error("Error adding option:", error);
    return NextResponse.json(
      { error: "Failed to add option" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const value = searchParams.get("value");

    if (!type || !["states", "sectors"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
    }

    if (!value) {
      return NextResponse.json(
        { error: "Value parameter is required" },
        { status: 400 }
      );
    }

    const optionsRef = db.collection("options").doc(type);
    const doc = await optionsRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Options not found" }, { status: 404 });
    }

    let items = doc.data().items || [];
    const initialLength = items.length;
    items = items.filter((item) => item.value !== value);

    if (items.length === initialLength) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    await optionsRef.set({ items });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting option:", error);
    return NextResponse.json(
      { error: "Failed to delete option" },
      { status: 500 }
    );
  }
}

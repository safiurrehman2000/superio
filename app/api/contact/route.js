import { adminDb } from "@/utils/firebase-admin";
import { sanitizeFormData } from "@/utils/sanitization";
import { NextResponse } from "next/server";

/**
 * POST /api/contact
 * Submit a contact form query
 */
export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitize the input data
    const fieldTypes = {
      name: "name",
      email: "email",
      subject: "text",
      message: "description",
    };

    const sanitizedData = sanitizeFormData(
      { name, email, subject, message },
      fieldTypes
    );

    // Create the contact query document
    const contactData = {
      ...sanitizedData,
      status: "pending", // pending, resolved
      createdAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
    };

    // Add to Firestore
    const docRef = await adminDb.collection("contactQueries").add(contactData);

    console.log(`✅ Contact query created with ID: ${docRef.id}`);

    return NextResponse.json({
      success: true,
      message: "Contact query submitted successfully",
      queryId: docRef.id,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while submitting contact form",
      },
      { status: 500 }
    );
  }
}

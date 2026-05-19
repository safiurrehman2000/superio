import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const TEXT = "#000000";
const MUTED = "#333333";

function formatEuro(cents) {
  if (cents === 0) return "0,00 euro";
  const n = (cents / 100).toFixed(2).replace(".", ",");
  return `${n} euro`;
}

/**
 * Optional raster logo (PNG/JPEG) — place at `public/images/receipt-logo.png` to use it.
 * SVG is not supported by PDFKit; no sharp dependency.
 */
function tryLoadRasterLogo() {
  const candidates = [
    path.join(process.cwd(), "public/images/receipt-logo.png"),
    path.join(process.cwd(), "public/images/resource/logo.png"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * @param {object} params
 * @param {string} params.invoiceTitle
 * @param {string} params.dateShort
 * @param {{ logoText: string, name: string, line1: string, line2: string, vat: string }} params.seller
 * @param {string[]} params.customerLines
 * @param {string} params.lineDescription
 * @param {number} params.lineExclCents
 * @param {number} params.taxCents
 * @param {number} params.totalCents
 * @param {string} params.vatRateLabel
 * @param {string} params.termsUrl
 * @returns {Promise<Buffer>}
 */
export function generateBrandedReceiptPdf({
  invoiceTitle,
  dateShort,
  seller,
  customerLines,
  lineDescription,
  lineExclCents,
  taxCents,
  totalCents,
  vatRateLabel,
  termsUrl,
}) {
  const rasterLogoPath = tryLoadRasterLogo();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = 595.28;
    const pageH = 841.89;
    const margin = 56;
    const contentW = pageW - margin * 2;
    const rightBlockW = 210;
    const rightX = pageW - margin - rightBlockW;
    const leftX = margin;

    let leftY = margin;
    let usedRasterLogo = false;

    if (rasterLogoPath) {
      try {
        doc.image(rasterLogoPath, leftX, leftY, { width: 150 });
        leftY += 44;
        doc
          .strokeColor(TEXT)
          .lineWidth(0.5)
          .moveTo(leftX, leftY)
          .lineTo(leftX + 160, leftY)
          .stroke();
        leftY += 12;
        usedRasterLogo = true;
      } catch {
        usedRasterLogo = false;
        leftY = margin;
      }
    }

    if (!usedRasterLogo) {
      leftY = margin;
      doc
        .fillColor(TEXT)
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(seller.logoText, leftX, leftY);
      leftY += 16;
      doc
        .strokeColor(TEXT)
        .lineWidth(0.5)
        .moveTo(leftX, leftY)
        .lineTo(leftX + 160, leftY)
        .stroke();
      leftY += 12;
    }

    doc.fillColor(TEXT).font("Helvetica").fontSize(9);
    for (const line of [seller.name, seller.line1, seller.line2, seller.vat]) {
      doc.text(line, leftX, leftY, { width: 260 });
      leftY += 12;
    }

    leftY += 6;
    doc.text(`Datum ${dateShort}`, leftX, leftY);
    leftY += 8;

    let rightY = margin;
    const cust = customerLines.filter((l) => l && String(l).trim());
    doc.fillColor(TEXT).font("Helvetica").fontSize(9);
    for (const line of cust) {
      doc.text(line, rightX, rightY, {
        width: rightBlockW,
        align: "right",
      });
      rightY += 12;
    }

    const sectionTop = Math.max(leftY, rightY) + 28;
    doc
      .fillColor(TEXT)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(invoiceTitle, leftX, sectionTop, {
        width: contentW,
        align: "center",
      });

    let y = sectionTop + 40;
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("Omschrijving", leftX, y);
    doc.text("prijs", leftX, y, { width: contentW, align: "right" });
    y += 14;
    doc.strokeColor("#cccccc").moveTo(leftX, y).lineTo(pageW - margin, y).stroke();
    y += 12;

    const priceColW = 90;
    doc.font("Helvetica").fontSize(9).fillColor(TEXT);
    doc.text(lineDescription, leftX, y, {
      width: contentW - priceColW - 16,
    });
    doc.text(formatEuro(lineExclCents), leftX, y, {
      width: contentW,
      align: "right",
    });
    y += 36;

    const rowAmountX = pageW - margin - priceColW;
    const rowLabelW = 140;
    doc.font("Helvetica").fontSize(9);
    const vatRowLabel =
      /btw/i.test(vatRateLabel) || vatRateLabel.includes("%")
        ? vatRateLabel.replace(/\s*%\s*$/, "").trim()
        : `${vatRateLabel}%`;
    doc.text(`BTW (${vatRowLabel}):`, rowAmountX - rowLabelW, y, {
      width: rowLabelW,
      align: "right",
    });
    doc.text(formatEuro(taxCents), rowAmountX, y, {
      width: priceColW,
      align: "right",
    });
    y += 14;
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("TOTAAL:", rowAmountX - rowLabelW, y, {
      width: rowLabelW,
      align: "right",
    });
    doc.text(formatEuro(totalCents), rowAmountX, y, {
      width: priceColW,
      align: "right",
    });

    const footerY = pageH - margin - 28;
    doc.fillColor(MUTED).font("Helvetica").fontSize(8);
    doc.text(
      "De Algemene voorwaarden zijn van toepassing en zijn te inzage beschikbaar op de website ",
      leftX,
      footerY,
      { width: contentW, continued: true }
    );
    doc.fillColor("#0000cc").text(termsUrl, {
      link: termsUrl,
      underline: true,
      continued: false,
    });

    doc.end();
  });
}

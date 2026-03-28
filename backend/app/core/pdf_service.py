import io
import httpx
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

async def fetch_pdf(url: str) -> bytes:
    """Télécharge le PDF original depuis Cloudinary ou S3."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content

def add_watermark(input_pdf_bytes: bytes, watermark_text: str) -> bytes:
    """
    Ajoute un filigrane sur chaque page du PDF en mémoire.
    Retourne les octets du nouveau PDF.
    """
    # 1. Créer le PDF contenant uniquement le filigrane
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=A4)
    can.setFont("Helvetica-Bold", 36)
    
    # Couleur grise transparente
    can.setFillColorRGB(0.7, 0.7, 0.7)
    
    # Rotation et centrage
    can.translate(300, 400)
    can.rotate(45)
    can.drawCentredString(0, 0, watermark_text)
    can.save()
    
    packet.seek(0)
    watermark_pdf = PdfReader(packet)
    watermark_page = watermark_pdf.pages[0]

    # 2. Fusionner avec le PDF d'origine
    original_pdf = PdfReader(io.BytesIO(input_pdf_bytes))
    writer = PdfWriter()

    for i in range(len(original_pdf.pages)):
        page = original_pdf.pages[i]
        page.merge_page(watermark_page)
        writer.add_page(page)

    output_pdf = io.BytesIO()
    writer.write(output_pdf)
    return output_pdf.getvalue()

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const msg = (body.content || '').toLowerCase();
    let botResponse = '';

    if (msg.includes('precio') || msg.includes('cuanto cuesta') || msg.includes('costo')) {
      botResponse = 'Los precios varian segun el producto. Te recomiendo revisar nuestro catalogo donde cada producto muestra su precio. ¿Buscas algo en particular?';
    } else if (msg.includes('horario') || msg.includes('abierto') || msg.includes('atend')) {
      botResponse = 'Estamos disponibles por mensaje las 24 horas! Si necesitas algo urgente, contactanos por WhatsApp.';
    } else if (msg.includes('envio') || msg.includes('entrega')) {
      botResponse = 'Realizamos envios a todo el pais. El costo depende de tu ubicacion. Cuentanos tu codigo postal y te damos detalles!';
    } else if (msg.includes('pago') || msg.includes('pagar') || msg.includes('tarjeta')) {
      botResponse = 'Aceptamos pagos con tarjeta, tambien puedes comprar por Mercado Libre o Facebook Marketplace. ¿Que producto te interesa?';
    } else if (msg.includes('hola') || msg.includes('buenos') || msg.includes('hi') || msg === '') {
      botResponse = 'Hola! Bienvenido/a a Kawaii Anime Store. ¿En que puedo ayudarte? Puedo mostrarte nuestros productos, precios, o contestar cualquier duda.';
    } else if (msg.includes('gracias') || msg.includes('thanks')) {
      botResponse = 'De nada! Si tienes mas preguntas no dudes en escribir. ¡Que tengas un dia genial!';
    } else if (msg.includes('ropa') || msg.includes('modific')) {
      botResponse = 'Hacemos modificaciones de ropa de segunda mano: convertimos pantalones en shorts, agregamos mangas, cuellos, dibujos y mas. ¿Te interesa algo especifico?';
    } else if (msg.includes('dibujo') || msg.includes('imprim')) {
      botResponse = 'Realizamos dibujos de personajes de anime e los imprimimos en papel fotografico de alta calidad. ¿Que personaje te gustaria?';
    } else if (msg.includes('pin') || msg.includes('llavero') || msg.includes('joyer')) {
      botResponse = 'Tenemos pines, llaveros y joyeria con diseños kawaii, chibi y de personajes de anime. Los precios empiezan desde $20 MXN. ¡Visita nuestro catalogo!';
    } else {
      botResponse = 'Gracias por tu mensaje. ¿Podrias decirme que producto te interesa? Si prefieres, puedes dejar tu nombre, telefono y correo y te contactamos directamente.';
    }

    const needsForward = body.customerName && (body.customerPhone || body.customerEmail);
    let forwardInfo: { whatsappLink: string; email: string; customerInfo: { name: string; phone: string; email: string; message: string } } | null = null;
    if (needsForward) {
      const waMsg = encodeURIComponent(
        'Nuevo cliente en el chatbot:\n' +
        'Nombre: ' + body.customerName + '\n' +
        'Telefono: ' + (body.customerPhone || 'No proporcionado') + '\n' +
        'Email: ' + (body.customerEmail || 'No proporcionado') + '\n' +
        'Mensaje: ' + body.content
      );
      forwardInfo = {
        whatsappLink: 'https://wa.me/5215512345678?text=' + waMsg,
        email: 'tienda@kawaianime.com',
        customerInfo: { name: body.customerName, phone: body.customerPhone, email: body.customerEmail, message: body.content },
      };
    }

    return NextResponse.json({ botMessage: { role: 'bot', content: botResponse }, forwardInfo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

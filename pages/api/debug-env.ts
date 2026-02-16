import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Solo en desarrollo: comprueba si Next.js ve las variables de GitHub OAuth.
 * No muestra valores, solo si existen. Borra o ignora esta ruta en producción.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).end();
  }
  const id = process.env.GITHUB_CLIENT_ID;
  const secret = process.env.GITHUB_CLIENT_SECRET;
  const githubKeys = Object.keys(process.env).filter((k) =>
    k.toUpperCase().includes('GITHUB')
  );
  res.json({
    GITHUB_CLIENT_ID: id ? '✓ definida' : '✗ falta',
    GITHUB_CLIENT_SECRET: secret ? '✓ definida' : '✗ falta',
    // Si las claves existen pero el valor falta, Next inlinó env al compilar. Borra .next y reinicia.
    longitud_valor_id: id?.length ?? 'undefined',
    longitud_valor_secret: secret?.length ?? 'undefined',
    todasLasClavesConGITHUB: githubKeys,
  });
}

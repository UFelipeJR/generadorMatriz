# Generador de Matriz para Vercel

Este proyecto convierte tu app de Python/Pygame en una web estática lista para desplegar en Vercel.

## Estructura

- `index.html`
- `styles.css`
- `app.js`
- `vercel.json`
- `assets/1.png` a `assets/8.png`

## Cómo usarlo

1. Copia tus imágenes dentro de `assets/` con estos nombres:
   - `1.png`
   - `2.png`
   - `3.png`
   - `4.png`
   - `5.png`
   - `6.png`
   - `7.png`
   - `8.png`
2. Sube esta carpeta a un repositorio.
3. Importa el repositorio en Vercel.
4. Vercel detectará que es un sitio estático y lo desplegará sin configuración extra.

## Qué conserva del script original

- Inputs de filas y columnas
- Validación de dimensiones
- Generación aleatoria del string hexadecimal
- Generación de matriz con valores entre 0 y 7
- Uso de `assets/1.png` a `assets/8.png`
- Placeholder cuando falta una imagen
- Vista responsive con scroll

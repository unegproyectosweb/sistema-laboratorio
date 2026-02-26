import { defineConfig } from "vitepress";

const githubUrl = process.env.VERCEL
  ? `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
  : "#";

const vitepressBase = process.env.VITEPRESS_BASE ?? "/";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sistema Laboratorio UNEG",
  description: "Gestión de Reservas de Laboratorios",
  base: vitepressBase,

  srcDir: ".",
  themeConfig: {
    nav: [
      { text: "Inicio", link: "/" },
      { text: "Frontend", link: "/frontend/" },
      { text: "Backend", link: "/backend/" },
    ],

    sidebar: {
      "/frontend/": [
        {
          text: "Frontend",
          items: [
            { text: "Inicio", link: "/frontend/" },
            {
              text: "Decisiones técnicas",
              link: "/frontend/decisiones-tecnicas",
            },
            { text: "Despliegue", link: "/frontend/despliegue" },
          ],
        },
      ],
      "/backend/": [
        {
          text: "Backend",
          items: [
            { text: "Inicio", link: "/backend/" },
            { text: "Architectura", link: "/backend/arquitectura" },
            {
              text: "Decisiones técnicas",
              link: "/backend/decisiones-tecnicas",
            },
            { text: "Despliegue", link: "/backend/despliegue" },
            { text: "API Reference", link: "/backend/api" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: githubUrl }],
  },
});

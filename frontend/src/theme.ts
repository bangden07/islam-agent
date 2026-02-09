/* ── "Raudhah" — Premium Islamic theme for Chakra UI v3 ── */

import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        /* Deep emerald palette — richer, more premium greens */
        brand: {
          50:  { value: '#f0faf4' },
          100: { value: '#d4f0e0' },
          200: { value: '#a3dfc1' },
          300: { value: '#6bc99e' },
          400: { value: '#3bae7a' },
          500: { value: '#1a8f5c' },
          600: { value: '#12754a' },
          700: { value: '#0d5c3a' },
          800: { value: '#0a4a2f' },
          900: { value: '#073822' },
          950: { value: '#042618' },
        },
        /* Warm gold accents — luxurious & Islamic */
        gold: {
          50:  { value: '#fefbf0' },
          100: { value: '#fdf3d0' },
          200: { value: '#fae5a0' },
          300: { value: '#f5d06e' },
          400: { value: '#e8b83d' },
          500: { value: '#c9952a' },
          600: { value: '#a67921' },
          700: { value: '#845e18' },
          800: { value: '#6b4c14' },
          900: { value: '#513a0f' },
        },
        /* Warm cream — backgrounds */
        cream: {
          50:  { value: '#fefdfb' },
          100: { value: '#fdf9f2' },
          200: { value: '#f9f0e3' },
          300: { value: '#f3e5ce' },
          400: { value: '#e8d4b1' },
          500: { value: '#d4bc94' },
        },
      },
      fonts: {
        heading: { value: "'Plus Jakarta Sans', 'Inter', sans-serif" },
        body:    { value: "'Plus Jakarta Sans', 'Inter', sans-serif" },
        arabic:  { value: "'Amiri', 'Scheherazade New', serif" },
      },
    },
    semanticTokens: {
      colors: {
        /* Surface: warm cream instead of cold white */
        'bg.surface': {
          value: { _light: '{colors.cream.100}', _dark: '{colors.brand.950}' },
        },
        'bg.card': {
          value: { _light: '#ffffff', _dark: '{colors.brand.900}' },
        },
        /* Header: deep emerald gradient base */
        'bg.header': {
          value: { _light: '{colors.brand.800}', _dark: '{colors.brand.950}' },
        },
        'text.onHeader': {
          value: { _light: '#ffffff', _dark: '#d4f0e0' },
        },
        /* Gold accent border */
        'border.accent': {
          value: { _light: '{colors.gold.400}', _dark: '{colors.gold.600}' },
        },
        /* Subtle borders */
        'border.subtle': {
          value: { _light: '{colors.cream.300}', _dark: '{colors.brand.800}' },
        },
        /* User bubble gradient */
        'bg.userBubble': {
          value: { _light: '{colors.brand.700}', _dark: '{colors.brand.800}' },
        },
        /* Bot bubble  */
        'bg.botBubble': {
          value: { _light: '#ffffff', _dark: '{colors.brand.900}' },
        },
        /* Input area */
        'bg.input': {
          value: { _light: '#ffffff', _dark: '{colors.brand.900}' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

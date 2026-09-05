import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mapSupabaseRowToCar } from './fetch-sheet.js'

test('mapSupabaseRowToCar maps a Supabase veiculo row to the site car shape', () => {
  const row = {
    id: 'abc-123',
    marca: 'Jeep',
    modelo: 'Compass Limited',
    tipo: 'suv',
    ano: 2021,
    km: 42000,
    preco_venda: 119990,
    blindado: false,
    cambio: 'Automático',
    combustivel: 'Diesel',
    cor: 'Cinza',
    portas: 4,
    descricao: 'Único dono.',
    opcionais: ['Único dono'],
    fotos: ['https://example.com/foto1.jpg'],
  }

  const car = mapSupabaseRowToCar(row)

  assert.deepEqual(car, {
    id: 'abc-123',
    marca: 'Jeep',
    modelo: 'Jeep Compass Limited',
    tipo: 'suv',
    ano: 2021,
    km: 42000,
    preco: 119990,
    blindado: false,
    cambio: 'Automático',
    combustivel: 'Diesel',
    cor: 'Cinza',
    portas: 4,
    descricao: 'Único dono.',
    opcionais: ['Único dono'],
    fotos: ['https://example.com/foto1.jpg'],
  })
})

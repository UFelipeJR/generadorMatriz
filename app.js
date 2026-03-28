const NUM_IMGS = 8
const MAX_DIM = 32
const MAX_HEX = 4
const MIN_HEX_LEN = 4
const IMAGE_PATHS = Array.from({ length: NUM_IMGS }, (_, index) => `assets/${index + 1}.png`)

const state = {
  rows: 4,
  cols: 6,
  hexStr: '',
  maxChars: 0,
  matrix: [],
  error: '',
  missing: [],
  imageStatus: IMAGE_PATHS.map(() => false)
}

const refs = {
  controls: document.getElementById('controls'),
  rows: document.getElementById('rows'),
  cols: document.getElementById('cols'),
  generateBtn: document.getElementById('generateBtn'),
  hexBlock: document.getElementById('hexBlock'),
  hexValue: document.getElementById('hexValue'),
  hexMeta: document.getElementById('hexMeta'),
  errorMessage: document.getElementById('errorMessage'),
  missingMessage: document.getElementById('missingMessage'),
  assetsPath: document.getElementById('assetsPath'),
  emptyState: document.getElementById('emptyState'),
  matrixViewport: document.getElementById('matrixViewport'),
  matrixGrid: document.getElementById('matrixGrid'),
  cellTemplate: document.getElementById('cellTemplate')
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomHex(length) {
  const chars = '0123456789ABCDEF'
  return Array.from({ length }, () => chars[randomInt(0, chars.length - 1)]).join('')
}

function getValidatedDimensions() {
  const rows = Number.parseInt(refs.rows.value, 10)
  const cols = Number.parseInt(refs.cols.value, 10)

  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) {
    return { error: 'Filas y columnas deben ser enteros positivos' }
  }

  if (rows > MAX_DIM || cols > MAX_DIM) {
    return { error: 'Máximo 32 filas y 32 columnas' }
  }

  return { rows, cols }
}

async function probeImage(path) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(true)
    image.onerror = () => resolve(false)
    image.src = `${path}?v=${Date.now()}`
  })
}

async function refreshImageStatus() {
  const statuses = await Promise.all(IMAGE_PATHS.map((path) => probeImage(path)))
  state.imageStatus = statuses
  state.missing = statuses.flatMap((ok, index) => (ok ? [] : [index]))
}

function buildMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => randomInt(0, NUM_IMGS - 1)))
}

function computeCellSize() {
  const viewportWidth = refs.matrixViewport.clientWidth || refs.matrixViewport.offsetWidth || window.innerWidth
  const viewportHeight = refs.matrixViewport.clientHeight || 240
  const gap = 6
  const byWidth = Math.floor((viewportWidth - gap * (state.cols + 1)) / Math.max(state.cols, 1))
  const byHeight = Math.floor((viewportHeight - gap * (state.rows + 1)) / Math.max(state.rows, 1))
  return Math.max(28, Math.min(80, byWidth, byHeight))
}

function renderStatus() {
  const hasHex = state.hexStr.length > 0
  refs.hexBlock.hidden = !hasHex
  refs.hexValue.textContent = state.hexStr
  refs.hexMeta.textContent = hasHex ? `len=${state.hexStr.length} máx=${state.maxChars}` : ''

  refs.errorMessage.hidden = !state.error
  refs.errorMessage.textContent = state.error

  const hasMissing = state.missing.length > 0
  refs.missingMessage.hidden = !hasMissing
  refs.missingMessage.textContent = hasMissing
    ? `⚠ assets faltantes: ${state.missing.map((index) => `${index + 1}.png`).join(', ')}`
    : ''
}

function createCell(index) {
  const fragment = refs.cellTemplate.content.cloneNode(true)
  const cell = fragment.querySelector('.cell')
  const image = fragment.querySelector('.cell-image')
  const placeholder = fragment.querySelector('.cell-placeholder')
  const assetPath = IMAGE_PATHS[index]
  const available = state.imageStatus[index]

  if (available) {
    image.hidden = false
    image.src = assetPath
    image.alt = `Figura ${index + 1}`
  } else {
    placeholder.hidden = false
    placeholder.textContent = `?${index + 1}.png`
  }

  return cell
}

function renderMatrix() {
  const hasMatrix = state.matrix.length > 0

  refs.emptyState.hidden = hasMatrix
  refs.matrixViewport.hidden = !hasMatrix

  if (!hasMatrix) {
    refs.matrixGrid.replaceChildren()
    return
  }

  const cellSize = computeCellSize()
  refs.matrixGrid.style.setProperty('--cell-size', `${cellSize}px`)
  refs.matrixGrid.style.gridTemplateColumns = `repeat(${state.cols}, var(--cell-size))`

  const cells = []
  for (let row = 0; row < state.rows; row += 1) {
    for (let col = 0; col < state.cols; col += 1) {
      cells.push(createCell(state.matrix[row][col]))
    }
  }

  refs.matrixGrid.replaceChildren(...cells)
}

function render() {
  renderStatus()
  renderMatrix()
}

async function generateMatrix() {
  state.error = ''

  const dimensions = getValidatedDimensions()
  if (dimensions.error) {
    state.error = dimensions.error
    render()
    return
  }

  state.rows = dimensions.rows
  state.cols = dimensions.cols
  state.maxChars = MAX_HEX
  state.hexStr = randomHex(randomInt(MIN_HEX_LEN, MAX_HEX))
  state.matrix = buildMatrix(state.rows, state.cols)

  await refreshImageStatus()
  render()
}

refs.controls.addEventListener('submit', async (event) => {
  event.preventDefault()
  await generateMatrix()
})

window.addEventListener('resize', () => {
  if (state.matrix.length > 0) {
    renderMatrix()
  }
})

refs.assetsPath.textContent = new URL('assets/', window.location.href).pathname || './assets'

generateMatrix()

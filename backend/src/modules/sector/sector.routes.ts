import { Router } from 'express'
import { Sector } from './sector.model.js'

export const sectorRouter = Router()

/**
 * GET /sectors
 *
 * Returns all sectors from sector_table.
 */
sectorRouter.get('/', async (_req, res) => {
  try {
    const sectors = await Sector.findAll()

    res.status(200).json(sectors)
  } catch (error) {
    console.error('Failed to fetch sectors:', error)

    res.status(500).json({
      message: 'Failed to fetch sectors',
    })
  }
})
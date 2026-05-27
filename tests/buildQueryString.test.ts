import { describe, expect, it } from 'vitest'
import { buildQueryString } from '../src/adapters/buildQueryString'

describe('buildQueryString', () => {
  it('converts pageIndex 0 to page 1', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
    })
    expect(query).toContain('page=1')
    expect(query).toContain('per_page=25')
  })

  it('converts pageIndex 3 to page 4', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 3, pageSize: 10 },
    })
    expect(query).toContain('page=4')
    expect(query).toContain('per_page=10')
  })

  it('omits search when empty or whitespace-only', () => {
    const empty = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      globalFilter: '',
    })
    expect(empty).not.toContain('search')

    const whitespace = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      globalFilter: '   ',
    })
    expect(whitespace).not.toContain('search')
  })

  it('trims search whitespace', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      globalFilter: '  hafiz  ',
    })
    expect(query).toContain('search=hafiz')
  })

  it('encodes single-column sort', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      sorting: [{ id: 'name', desc: false }],
    })
    expect(decodeURIComponent(query)).toContain('sort=name:asc')
  })

  it('encodes multi-column sort comma-separated', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      sorting: [
        { id: 'name', desc: false },
        { id: 'created_at', desc: true },
      ],
    })
    expect(decodeURIComponent(query)).toContain('sort=name:asc,created_at:desc')
  })

  it('encodes scalar column filter as filter[key]=value', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      columnFilters: [{ id: 'status', value: 'active' }],
    })
    expect(decodeURIComponent(query)).toContain('filter[status]=active')
  })

  it('encodes array column filter as filter[key][]=v1&filter[key][]=v2', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      columnFilters: [{ id: 'role', value: ['admin', 'editor'] }],
    })
    const decoded = decodeURIComponent(query)
    expect(decoded).toContain('filter[role][]=admin')
    expect(decoded).toContain('filter[role][]=editor')
  })

  it('skips null, undefined, or empty filter values', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      columnFilters: [
        { id: 'a', value: null },
        { id: 'b', value: undefined },
        { id: 'c', value: '' },
        { id: 'd', value: 'real' },
      ],
    })
    expect(query).not.toContain('filter%5Ba%5D')
    expect(query).not.toContain('filter%5Bb%5D')
    expect(query).not.toContain('filter%5Bc%5D')
    expect(decodeURIComponent(query)).toContain('filter[d]=real')
  })

  it('skips empty entries inside array filter values', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      columnFilters: [{ id: 'tags', value: ['php', '', 'laravel'] }],
    })
    const decoded = decodeURIComponent(query)
    expect(decoded).toContain('filter[tags][]=php')
    expect(decoded).toContain('filter[tags][]=laravel')
    // No empty value should be present
    expect(decoded.match(/filter\[tags\]\[\]=/g)).toHaveLength(2)
  })

  it('merges extra params verbatim', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      extra: { tenant_id: '42', tags: ['a', 'b'] },
    })
    const decoded = decodeURIComponent(query)
    expect(decoded).toContain('tenant_id=42')
    expect(decoded).toContain('tags[]=a')
    expect(decoded).toContain('tags[]=b')
  })

  it('produces full canonical example correctly', () => {
    const query = buildQueryString({
      pagination: { pageIndex: 0, pageSize: 25 },
      sorting: [{ id: 'name', desc: false }],
      columnFilters: [{ id: 'status', value: 'active' }],
      globalFilter: 'hafiz',
    })
    const decoded = decodeURIComponent(query)
    expect(decoded).toContain('page=1')
    expect(decoded).toContain('per_page=25')
    expect(decoded).toContain('sort=name:asc')
    expect(decoded).toContain('search=hafiz')
    expect(decoded).toContain('filter[status]=active')
  })
})

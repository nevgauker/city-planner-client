import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BackButton from './BackButton'

describe('BackButton', () => {
  it('should render button with ChevronLeft icon', () => {
    const onClick = vi.fn()
    const { container } = render(<BackButton onClick={onClick} />)

    expect(container.querySelector('button')).toBeDefined()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<BackButton onClick={onClick} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(onClick).toHaveBeenCalled()
  })

  it('should have appropriate styling classes', () => {
    const onClick = vi.fn()
    const { container } = render(<BackButton onClick={onClick} />)

    const button = container.querySelector('button')
    expect(button?.className).toContain('glass-effect')
    expect(button?.className).toContain('card-elevation')
  })
})

export function getDimension(arg1: string): void
export function getDimension(
  arg1: number,
  arg2: number
): { width: number; height: number }

export function getDimension(
  arg1: string | number,
  arg2?: number
): void | { width: number; height: number } {
  if (typeof arg2 === 'undefined') {
    const img = new Image()
    img.addEventListener('load', function () {
      getDimension(this.naturalWidth, this.naturalHeight)
    })
    img.src = arg1 as string
  } else return { width: arg1 as number, height: arg2 }
}

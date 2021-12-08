function getDimension(arg1: string): void
function getDimension(
  arg1: number,
  arg2: number
): { width: number; height: number }

function getDimension(
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

console.log(
  getDimension(
    'https://images.unsplash.com/photo-1495954147468-729898cbe8aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YmlnfGVufDB8fDB8fA%3D%3D&w=1000&q=80'
  )
)

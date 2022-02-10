import randomColor from 'randomcolor'

export class AnnoColors {
  private colors: Map<string, string>

  constructor({})
  constructor({ categoryColors }: { categoryColors: Map<string, string> })
  constructor({ AnnoColors }: { AnnoColors: AnnoColors })
  constructor({
    categoryNames,
    colors
  }: {
    categoryNames: string[]
    colors: string[]
  })
  constructor({
    AnnoColors,
    categoryColors,
    categoryNames,
    colors
  }: {
    AnnoColors?: AnnoColors
    categoryColors?: Map<string, string>
    categoryNames?: string[]
    colors?: string[]
  }) {
    this.colors = new Map()
    if (AnnoColors || categoryColors) {
      this.colors = AnnoColors?.colors || categoryColors || new Map()
    } else if (categoryNames && colors) {
      for (let i = 0; i < categoryNames.length; i++) {
        this.colors.set(categoryNames[i], colors[i] || randomColor())
      }
    }
  }

  private getRandomColor() {
    let newColor = null
    do {
      newColor = randomColor({
        seed: Date.now(),
        format: 'rgba',
        alpha: 0.75,
        count: 1
      })[0]
    } while (Array.from(this.colors.values()).includes(newColor))
    return newColor
  }

  private addRandom(categoryName: string) {
    const newColor = this.getRandomColor()
    this.colors.set(categoryName, newColor)
    return newColor
  }

  size() {
    return this.colors.size
  }

  get(categoryName: string) {
    return this.colors.get(categoryName) || this.addRandom(categoryName)
  }

  set(categoryName: string, newColor: string): void {
    this.colors.set(categoryName, newColor)
  }

  rename(oldCategoryName: string, newCategoryName: string) {
    const color = this.colors.get(oldCategoryName)
    if (color) {
      this.colors.set(newCategoryName, color)
      this.colors.delete(oldCategoryName)
    }
  }
}

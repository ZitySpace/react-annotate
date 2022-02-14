import randomColor from 'randomcolor'

export class AnnoColor {
  private colors: Map<string, string>

  constructor({})
  constructor({ categoryColors }: { categoryColors: Map<string, string> })
  constructor({ annoColor }: { annoColor: AnnoColor })
  constructor({
    categoryNames,
    colors
  }: {
    categoryNames: string[]
    colors: string[]
  })
  constructor({
    annoColor,
    categoryColors,
    categoryNames,
    colors
  }: {
    annoColor?: AnnoColor
    categoryColors?: Map<string, string>
    categoryNames?: string[]
    colors?: string[]
  }) {
    this.colors = new Map()
    if (annoColor || categoryColors) {
      this.colors = annoColor?.colors || categoryColors || new Map()
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

  private addRandom(category: string) {
    const newColor = this.getRandomColor()
    this.colors.set(category, newColor)
    return newColor
  }

  size() {
    return this.colors.size
  }

  get(category: string) {
    return this.colors.get(category) || this.addRandom(category)
  }

  set(category: string, color: string): void {
    this.colors.set(category, color)
  }

  rename(oldCategoryName: string, newCategoryName: string) {
    const color = this.colors.get(oldCategoryName)
    if (color) {
      this.colors.set(newCategoryName, color)
      this.colors.delete(oldCategoryName)
    }
  }
}

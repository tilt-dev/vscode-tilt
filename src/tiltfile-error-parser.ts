const locationPattern = `(?<file>[A-Za-z0-9\/ \\\._-]+):(?<line>[1-9][0-9]*):(?<col>[1-9][0-9]*)`
const tracebackLocationRe = new RegExp(`^\\s*${locationPattern}`)
const simpleErrorRe = new RegExp(`^${locationPattern}: (?<message>.+)`)
const loadErrorRe = new RegExp(
  `Error: cannot load \\S+: ${locationPattern}: .+`
)

export type Location = {
  path: string
  line: number
  col: number
}

// m must be a match from `pathLineColPattern`
function matchToLocation(m: RegExpMatchArray): Location {
  return {
    path: m.groups.file,
    line: parseInt(m.groups.line),
    col: parseInt(m.groups.col),
  }
}

export function parseTiltfileError(error: string): {
  message: string
  locations: Location[]
} {
  if (error.startsWith("Traceback")) {
    const lines = error.split("\n")
    let locations = new Array<Location>()
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      let match = line.match(tracebackLocationRe)
      if (match) {
        locations.push(matchToLocation(match))
      } else {
        match = line.match(loadErrorRe)
        if (match) {
          locations.push(matchToLocation(match))
        }
        const message = lines.splice(i, lines.length - i).join("\n")
        return {
          message: message,
          locations: locations,
        }
      }
    }
  }

  const match = error.match(simpleErrorRe)
  if (match) {
    return {
      message: match.groups.message,
      locations: [matchToLocation(match)],
    }
  }
  return { message: "", locations: [] }
}

import { readFileSync } from 'fs'
import * as TOML from 'toml'


export var skills: App.Skill[] = []


export function sync () {
  var source = readFileSync(__dirname + '/../game-assets/skills.toml', 'utf8')
  var importedSkills = TOML.parse(source)

  skills = importedSkills.skill.map( (sk: any) => {

    sk.time = sk.time || {}

    var imported: App.Skill = {
      name: sk.name,
      range: sk.range || 100,
      cost: sk.cost || {},
      time: {
        chargeup: sk.time.chargeup || 0,
        cooldown: sk.time.cooldown || 0,
        limit: sk.time.limit || 4,
      },
      target: sk.target, // TODO: Validate
      effects: sk.effect || [] // TODO: Validate
    }

    return imported
  })
}

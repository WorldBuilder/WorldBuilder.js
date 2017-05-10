import { readFileSync } from 'fs'
import * as TOML from 'toml'


export var skills: App.Skill[] = []


export function sync () {
  var source = readFileSync(__dirname + '/../game-assets/skills.toml', 'utf8')
  var importedSkills = TOML.parse(source)

  // TODO: Validate importedSkills

  skills = importedSkills.skill.map( (sk: any) => {
    sk.effects = sk.effect
    delete sk.effect
    return sk
  })
}

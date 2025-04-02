import { type Command } from "commander"

export type CommandData = {
    name: string,
    definition: string,
    description: string,
    [key: string]: any
}


export async function initCommands(commands: CommandData[], program: Command): Promise<void> {
    if (commands.length == 0) {
        return
    }

    for (let i=0; i < commands.length; i++) {
        const command = program
            .command(commands[i].definition)
            .description(commands[i].description)
            .action(commands[i].action)
        
        if ('options' in commands[i]) {
            commands[i].options.forEach((element: string[]) => {
                const [flags, description, defaultValue] = [...element]
                command
                    .option(flags, description, defaultValue)
            });
        }
    
    }

    return
}

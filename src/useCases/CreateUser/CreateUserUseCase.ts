import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ICreateUserRequestDTO } from "./CreateUserDTO";
import { User } from "../../entities/User";
import { IMailProvider } from "../../providers/IMailProvider";

/*1º Single Responsiblity Principle
    CreateUserUseCase esta classe tem uma unica responsabilidade que é criar usuario
    pra ele nao importa onde vai ser salvo. unica reponsabilidade 
    é verificar se o usuario existe ou não e criar
*/
/* 2º Liskov Substitution Principle
    usersRepository e falando que o tipo dele é IUsersRepository um contrato
    que define quais metodos vao existir dentro de um repositorio
    nao interessa qual repositorio vai ser passado. ex post postgres,mysql,sqlserver
    se tiver esses metodos vai funcionar
*/
/* 3º Dependency Inversion Principle
    a classe nao esta dependendo diretamente da implementaação do usuario
    esta dependendod e outra classe que faz a implementação de inserri, listar atualizar
    depende somente da abstaração daquela implementção de interface
 */
export class CreateUserUseCase {

    constructor(
        private usersRepository: IUsersRepository,
        private mailProvider: IMailProvider
    ) { }

    async execute(data: ICreateUserRequestDTO) {
        const userAlreadyExists = await this.usersRepository.findByEmail(data.email);
        if (userAlreadyExists) {
            throw new Error('User already exists.');
        }
        const user = new User(data);
        await this.usersRepository.save(user);

        await this.mailProvider.sendMail({
            to: {
                name: data.name,
                email: data.email,
            },
            from: {
                name: 'Equipe do meu app',
                email: 'equipe@meuapp.com',
            },
            subject: 'Seja bem-vindo a plataforma',
            body: '<p>voce ja pode fazer login em nossa plataforma</p>'
        })
    }
}
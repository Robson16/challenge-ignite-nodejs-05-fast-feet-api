import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { User } from '@/domain/user/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findByCPF(cpf: string) {
    const user = this.items.find((item) => item.cpf.value === cpf)

    if (!user) {
      return null
    }

    return user
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async create(user: User) {
    this.items.push(user)
  }
}

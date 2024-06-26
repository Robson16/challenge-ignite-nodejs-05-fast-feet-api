import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { makePacket } from 'test/factories/make-packet'
import { InMemoryDestinationsRepository } from 'test/repositories/in-memory-destinations-repository'
import { InMemoryPacketsRepository } from 'test/repositories/in-memory-packets-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UpdatePacketStatusToReturnedUseCase } from './packet-update-status-to-returned.usecase'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryDestinationsRepository: InMemoryDestinationsRepository
let inMemoryPacketsRepository: InMemoryPacketsRepository
let sut: UpdatePacketStatusToReturnedUseCase // Subject Under Test

describe('Return Packet', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryDestinationsRepository = new InMemoryDestinationsRepository()
    inMemoryPacketsRepository = new InMemoryPacketsRepository(
      inMemoryUsersRepository,
      inMemoryDestinationsRepository,
    )
    sut = new UpdatePacketStatusToReturnedUseCase(inMemoryPacketsRepository)
  })

  it('should be able to return a packet', async () => {
    const packet = makePacket({
      status: 'WITHDRAWN',
    })

    await inMemoryPacketsRepository.create(packet)

    const result = await sut.execute({
      packetId: packet.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryPacketsRepository.items[0]).toMatchObject({
      delivererId: undefined,
      status: 'RETURNED',
    })
  })

  it('should not be able to return a non existing packet', async () => {
    const result = await sut.execute({
      packetId: 'non-existing-packet-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to define a packet as returned that already is defined as it', async () => {
    const packet = makePacket({
      delivererId: undefined,
      status: 'RETURNED',
    })

    await inMemoryPacketsRepository.create(packet)

    const result = await sut.execute({
      packetId: packet.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})

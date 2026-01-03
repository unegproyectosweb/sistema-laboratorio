import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Laboratory } from "./entities/laboratory.entity";
import { CreateLaboratoryDto, UpdateLaboratoryDto } from "./laboratory.dto";

@Injectable()
export class LaboratoriesService {
  constructor(
    @InjectRepository(Laboratory)
    private readonly laboratoryRepo: Repository<Laboratory>,
  ) {}

  async create(createLaboratoryDto: CreateLaboratoryDto) {
    const lab = this.laboratoryRepo.create(createLaboratoryDto);
    return await this.laboratoryRepo.save(lab);
  }

  async findAll() {
    return await this.laboratoryRepo.find({ order: { number: "ASC" } });
  }

  async findOne(id: number) {
    const lab = await this.laboratoryRepo.findOneBy({ id });
    if (!lab)
      throw new NotFoundException(`Laboratorio con id ${id} no encontrado`);
    return lab;
  }

  async update(id: number, updateLaboratoryDto: UpdateLaboratoryDto) {
    const lab = await this.findOne(id); // Verifica si existe
    const updatedLab = Object.assign(lab, updateLaboratoryDto);
    return await this.laboratoryRepo.save(updatedLab);
  }

  async remove(id: number) {
    const lab = await this.findOne(id);
    return await this.laboratoryRepo.remove(lab);
  }
}

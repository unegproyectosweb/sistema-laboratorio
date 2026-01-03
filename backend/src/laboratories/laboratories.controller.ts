import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { LaboratoriesService } from "./laboratories.service";
import { CreateLaboratoryDto, UpdateLaboratoryDto } from "./laboratory.dto";

@Controller("laboratories")
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  @Post()
  create(@Body() createLaboratoryDto: CreateLaboratoryDto) {
    return this.laboratoriesService.create(createLaboratoryDto);
  }

  @Get()
  findAll() {
    return this.laboratoriesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.laboratoriesService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateLaboratoryDto: UpdateLaboratoryDto,
  ) {
    return this.laboratoriesService.update(id, updateLaboratoryDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.laboratoriesService.remove(id);
  }
}

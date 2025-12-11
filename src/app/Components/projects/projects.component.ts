import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { projetoField } from '../../Interfaces/projectField';
import { ProjectService } from '../../Services/project.service';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projects: projetoField[] = [];
  filteredProjects: projetoField[] = [];
  formGroupProject: FormGroup;
  isEditing = false;
  mensagem = '';
  mensagemError = '';
  submitted = false;
  searchTerm = '';
  selectedStatus = '';

  constructor(
    private projectService: ProjectService,
    private formBuilder: FormBuilder
  ) {
    this.formGroupProject = formBuilder.group({
      id: [''],
      nome: ['', Validators.required],
      descricao: [''],
      status: ['', Validators.required],
      dataCriacao: [''],
      dataFim: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.formGroupProject.get('nome')?.valueChanges?.subscribe(() => {
      this.filterProjects();
    });
    this.formGroupProject.get('descricao')?.valueChanges?.subscribe(() => {
      this.filterProjects();
    });
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (json) => {
        this.projects = json || [];
        this.filterProjects();
      },
      error: () => { this.projects = []; }
    });
  }

  filterProjects(): void {
    const term = (this.searchTerm || '').toLowerCase();
    this.filteredProjects = this.projects.filter(p => {
      const safeName = (p.nome || '').toString().toLowerCase();
      const safeDesc = (p.descricao || '').toString().toLowerCase();
      const matchesSearch = safeName.includes(term) || safeDesc.includes(term);
      const matchesStatus = !this.selectedStatus || p.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  delete(project: projetoField): void {
    const confirmar = confirm(`Tem certeza que deseja excluir o projeto com id "${project.id}"?`);
    if (confirmar) {
      this.projectService.delete(project).subscribe({
        next: () => this.loadProjects()
      });
    }
  }

  onClickUpdate(project: projetoField): void {
    this.isEditing = true;
    this.formGroupProject.patchValue(project);
  }

  update(): void {
    this.submitted = true;
    if (this.formGroupProject.invalid) {
      this.mensagemError = 'Preencha todos os campos obrigatórios.';
      setTimeout(() => this.mensagemError = '', 3000);
      return;
    }

    this.projectService.update(this.formGroupProject.value).subscribe({
      next: () => {
        this.mensagem = 'Projeto atualizado com sucesso!';
        setTimeout(() => this.mensagem = '', 3000);
        this.loadProjects();
        this.clear();
      },
      error: () => {
        this.mensagemError = 'Erro ao atualizar projeto.';
        setTimeout(() => this.mensagemError = '', 3000);
      }
    });
  }

  save(): void {
    this.submitted = true;
    if (this.formGroupProject.invalid) {
      this.mensagemError = 'Preencha todos os campos obrigatórios.';
      setTimeout(() => this.mensagemError = '', 3000);
      return;
    }

    this.projectService.save(this.formGroupProject.value as projetoField).subscribe({
      next: (json: projetoField) => {
        this.projects.push(json);
        this.mensagem = 'Projeto adicionado com sucesso!';
        setTimeout(() => this.mensagem = '', 3000);
        this.loadProjects();
        this.clear();
      },
      error: () => {
        this.mensagemError = 'Erro ao salvar projeto.';
        setTimeout(() => this.mensagemError = '', 3000);
      }
    });
  }

  clear(): void {
    this.isEditing = false;
    this.submitted = false;
    this.formGroupProject.reset();
  }
}

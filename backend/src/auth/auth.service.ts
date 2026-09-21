import {
  Injectable, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { buildNombreCompleto } from '../common/utils/nombre.util';
import * as bcrypt from 'bcryptjs';
import { UsersSafs } from '../models/users-safs.model';
import { SUsuario } from '../models/s-usuario.model';
import { SUsers } from '../models/s-users.model';
import { IniAccesosModulos } from '../models/ini-accesos-modulos.model';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UsersSafs, 'saf') private usersSafsModel: typeof UsersSafs,
    @InjectModel(SUsuario, 'saf') private sUsuarioModel: typeof SUsuario,
    @InjectModel(SUsers, 'saf') private sUsersModel: typeof SUsers,
    @InjectModel(IniAccesosModulos) private accesosModel: typeof IniAccesosModulos,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersSafsModel.findOne({
      where: { rfc: dto.rfc.toUpperCase() },
      attributes: ['id', 'rfc', 'name', 'email', 'path_foto', 'password'],
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Contraseña incorrecta');

    const perfil = await this.construirPerfil(user);
    const token = this.jwtService.sign({ sub: user.id, rfc: user.rfc, name: user.name });

    return { token, usuario: perfil };
  }

  async getProfile(rfc: string) {
    const user = await this.usersSafsModel.findOne({ where: { rfc } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.construirPerfil(user);
  }

  private async construirPerfil(user: UsersSafs) {
    const [datosUser, sUser, modulos] = await Promise.all([
      this.sUsuarioModel.findOne({
        where: { N_Usuario: user.rfc },
        attributes: ['Nombre', 'A_Paterno', 'A_Materno', 'Puesto', 'id_Dependencia', 'id_Direccion', 'id_Departamento'],
      }),
      this.sUsersModel.findOne({ where: { username: user.rfc }, attributes: ['rango'] }),
      this.accesosModel.findAll({ where: { rfc: user.rfc, activo: 1 }, attributes: ['modulo'] }),
    ]);

    return {
      id:               user.id,
      rfc:              user.rfc,
      name:             user.name,
      email:            user.email,
      foto:             user.path_foto,
      nombre_completo:  datosUser
        ? buildNombreCompleto(datosUser.Nombre, datosUser.A_Paterno, datosUser.A_Materno)
        : user.name,
      puesto:           datosUser?.Puesto ?? null,
      rango:            sUser?.rango ?? null,
      id_Dependencia:   datosUser?.id_Dependencia ?? null,
      id_Direccion:     datosUser?.id_Direccion ?? null,
      id_Departamento:  datosUser?.id_Departamento ?? null,
      modulos:          modulos.map(m => m.modulo),
    };
  }
}

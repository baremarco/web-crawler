# Descripcion del Proyecto.
- Guardar los archivos PDF en un S3
- Guardar los datos de la pagina de manera estructurada
- Esto tiene que correr en un container de docker
- Implementar [Anti-Captcha](https://anti-captcha.com/)
- Usar [Puppeteer](https://pptr.dev)
- [Target Site](http://scw.pjn.gov.ar/scw/home.seam)
    + Seleccionar Exp: `13540` Year: `2019`  
    + Seleccionar juruisdiccion: Camara nacional de apelaciones de trabajo (CNT)
    
## Tareas

### Principal
- Migrar de Playwrigth a Puppeteer
- Regresar JSON con la informacion de la tabla
	+ bypass del catpcha con Anti-Captcha
	+ armar el JSON usando como key principal la fecha:
	```
	[
		{"18-08-2023": {
			"office": "MPA",
			"type": "PASE",
			"detail": "Detalle: JUZGADO NACIONAL DE 1RA INSTANCIA DEL TRABAJO NRO. 41"
			}
		},
	 	{"18-08-2023": {
			"ofice": "MPA",
			"type": "RECEPCION PASE",
			"detail": "CÁMARA NACIONAL DE APELACIONES DEL TRABAJO - MESA DE PASES"
			}
		},
	]
	```
### Secundarias
- Descargar la informacion de los botones del lado izquierdo de la tabla y guardarse en un S3.
- El JSON de la tarea principal guardarlo en un S3.

## Referencia
- [puppeteer docs](https://pptr.dev/category/guides)
- [gravity stack](https://usegravity.app/)
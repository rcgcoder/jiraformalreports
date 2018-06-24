var result=
				/*Trabajo con cambio de Fase durante el periodo que ha retrocedido de Fase (wRetrocedidoFase)*/
				(  
					/*Trabajo con importe aprobado (wAlgoFacturado) */
					(
						(
							/*Trabajo Adelantado (wAdvIssues)*/
							(
										/*Trabajo de la UTE (wUTE)*/
										(
											_arrRefs_[123].fieldValue('Proyecto.key') !='OT'
										) 
								&&
								(_arrRefs_[122].fieldValue('Fase',false,_arrRefs_[121]) < 4) 
								&& 
								(new Date(_arrRefs_[120].fieldValue('created')) < _arrRefs_[119])
							) 
						&& 
						(_arrRefs_[118].fieldValue('Fase',false,_arrRefs_[117]) >= 2)
						)
						||
						(
							/*Trabajo no Adelantado (wIssues) */
							(
										/*Trabajo de la UTE (wUTE)*/
										(
											_arrRefs_[116].fieldValue('Proyecto.key') !='OT'
										)
								&&
								(new Date(_arrRefs_[115].fieldValue('created')) > _arrRefs_[114])
							)   
						&& 
						(_arrRefs_[113].fieldValue('Fase',false,_arrRefs_[112]) >= 2)
						)
					)   
					|| 
					/*Trabajo Facturable durante el periodo por haber cambiado de fase (wFacturablePorFase)*/
					(  
							/*Trabajo con cambio de Fase durante el periodo (wAvanceFase)*/
							(  
										/*Trabajo de la Prorroga (wProrroga) */
										(
														/*Trabajo Adelantado (wAdvIssues)*/
														(
																	/*Trabajo de la UTE (wUTE)*/
																	(
																		_arrRefs_[111].fieldValue('Proyecto.key') !='OT'
																	) 
															&&
															(_arrRefs_[110].fieldValue('Fase',false,_arrRefs_[109]) < 4) 
															&& 
															(new Date(_arrRefs_[108].fieldValue('created')) < _arrRefs_[107])
														) 
											|| 
														/*Trabajo no Adelantado (wIssues) */
														(
																	/*Trabajo de la UTE (wUTE)*/
																	(
																		_arrRefs_[106].fieldValue('Proyecto.key') !='OT'
																	)
															&&
															(new Date(_arrRefs_[105].fieldValue('created')) > _arrRefs_[104])
														)  
										)  
								&& 
								(!
										/*Trabajo sin cambio de Fase durante el periodo (wMismaFase)*/
										(  
														/*Trabajo de la Prorroga (wProrroga) */
														(
																		/*Trabajo Adelantado (wAdvIssues)*/
																		(
																					/*Trabajo de la UTE (wUTE)*/
																					(
																						_arrRefs_[103].fieldValue('Proyecto.key') !='OT'
																					) 
																			&&
																			(_arrRefs_[102].fieldValue('Fase',false,_arrRefs_[101]) < 4) 
																			&& 
																			(new Date(_arrRefs_[100].fieldValue('created')) < _arrRefs_[99])
																		) 
															||
																		/*Trabajo no Adelantado (wIssues) */
																		(
																					/*Trabajo de la UTE (wUTE)*/
																					(
																						_arrRefs_[98].fieldValue('Proyecto.key') !='OT'
																					)
																			&&
																			(new Date(_arrRefs_[97].fieldValue('created')) > _arrRefs_[96])
																		)  
														)  
											&&
											(
											(_arrRefs_[95].fieldValue('Fase',false,_arrRefs_[94])) 
												== 
											(_arrRefs_[93].fieldValue('Fase',false,_arrRefs_[92]))
											) 
										)  
								) 
								&&
								(
								(_arrRefs_[91].fieldValue('Fase',false,_arrRefs_[90])) 
									> 
								(_arrRefs_[89].fieldValue('Fase',false,_arrRefs_[88]))
								) 
							)   
						&& 
							/*Trabajo en Fase Facturable (wFaseFacturable)*/
							(
								(
									/*Trabajo Adelantado (wAdvIssues)*/
									(
												/*Trabajo de la UTE (wUTE)*/
												(
													_arrRefs_[87].fieldValue('Proyecto.key') !='OT'
												) 
										&&
										(_arrRefs_[86].fieldValue('Fase',false,_arrRefs_[85]) < 4) 
										&& 
										(new Date(_arrRefs_[84].fieldValue('created')) < _arrRefs_[83])
									) 
								&& 
								(_arrRefs_[82].fieldValue('Fase',false,_arrRefs_[81]) >= 2)
								)
								||
								(
									/*Trabajo no Adelantado (wIssues) */
									(
												/*Trabajo de la UTE (wUTE)*/
												(
													_arrRefs_[80].fieldValue('Proyecto.key') !='OT'
												)
										&&
										(new Date(_arrRefs_[79].fieldValue('created')) > _arrRefs_[78])
									)   
								&& 
								(_arrRefs_[77].fieldValue('Fase',false,_arrRefs_[76]) >= 2)
								)
							)  
					)  
					|| 
					/*Trabajo Facturable durante el periodo por haber incrementado el tiempo trabajado acumulado (wFacturablePorTiempoTrabajado)*/
					(   
							/*Trabajo sin cambio de Fase durante el periodo (wMismaFase)*/
							(  
											/*Trabajo de la Prorroga (wProrroga) */
											(
															/*Trabajo Adelantado (wAdvIssues)*/
															(
																		/*Trabajo de la UTE (wUTE)*/
																		(
																			_arrRefs_[75].fieldValue('Proyecto.key') !='OT'
																		) 
																&&
																(_arrRefs_[74].fieldValue('Fase',false,_arrRefs_[73]) < 4) 
																&& 
																(new Date(_arrRefs_[72].fieldValue('created')) < _arrRefs_[71])
															) 
												|| 
															/*Trabajo no Adelantado (wIssues) */
															(
																		/*Trabajo de la UTE (wUTE)*/
																		(
																			_arrRefs_[70].fieldValue('Proyecto.key') !='OT'
																		)
																&&
																(new Date(_arrRefs_[69].fieldValue('created')) > _arrRefs_[68])
															)  
											)  
								&&
								(
								(_arrRefs_[67].fieldValue('Fase',false,_arrRefs_[66])) 
									== 
								(_arrRefs_[65].fieldValue('Fase',false,_arrRefs_[64]))
								) 
							)  
						&& 
							/*Trabajo en Fase Facturable (wFaseFacturable)*/
							(
								(
									/*Trabajo Adelantado (wAdvIssues)*/
									(
												/*Trabajo de la UTE (wUTE)*/
												(
													_arrRefs_[63].fieldValue('Proyecto.key') !='OT'
												) 
										&&
										(_arrRefs_[62].fieldValue('Fase',false,_arrRefs_[61]) < 4) 
										&& 
										(new Date(_arrRefs_[60].fieldValue('created')) < _arrRefs_[59])
									) 
								&& 
								(_arrRefs_[58].fieldValue('Fase',false,_arrRefs_[57]) >= 2)
								)
								||
								(
									/*Trabajo no Adelantado (wIssues) */
									(
												/*Trabajo de la UTE (wUTE)*/
												(
													_arrRefs_[56].fieldValue('Proyecto.key') !='OT'
												)
										&&
										(new Date(_arrRefs_[55].fieldValue('created')) > _arrRefs_[54])
									)   
								&& 
								(_arrRefs_[53].fieldValue('Fase',false,_arrRefs_[52]) >= 2)
								)
							)  
						&&
						(
							/*Tiempo Acumulado en hijos al final del periodo (childTimespentAtEnd)*/
							(
								_arrRefs_[51].fieldAccumChilds ('timespent',_arrRefs_[50])
							) 
							> 
							/*Tiempo Acumulado en hijos al inicio del periodo (childTimespentAtIni)*/
							(
								_arrRefs_[49].fieldAccumChilds ( 'timespent',_arrRefs_[48] )
							)
						)
					)  
				)   &&    (
				/*Trabajo con cambio de Fase durante el periodo que ha retrocedido de Fase (wRetrocedidoFase)*/
				(  
					/*Trabajo de la Prorroga (wProrroga) */
					(
									/*Trabajo Adelantado (wAdvIssues)*/
									(
												/*Trabajo de la UTE (wUTE)*/
												(
													_arrRefs_[47].fieldValue('Proyecto.key') !='OT'
												) 
										&&
										(_arrRefs_[46].fieldValue('Fase',false,_arrRefs_[45]) < 4) 
										&& 
										(new Date(_arrRefs_[44].fieldValue('created')) < _arrRefs_[43])
									) 
						|| 
									/*Trabajo no Adelantado (wIssues) */
									(
												/*Trabajo de la UTE (wUTE)*/
												(
													_arrRefs_[42].fieldValue('Proyecto.key') !='OT'
												)
										&&
										(new Date(_arrRefs_[41].fieldValue('created')) > _arrRefs_[40])
									)  
					)   
					&& (!
					/*Trabajo sin cambio de Fase durante el periodo (wMismaFase)*/
					(  
									/*Trabajo de la Prorroga (wProrroga) */
									(
													/*Trabajo Adelantado (wAdvIssues)*/
													(
																/*Trabajo de la UTE (wUTE)*/
																(
																	_arrRefs_[39].fieldValue('Proyecto.key') !='OT'
																) 
														&&
														(_arrRefs_[38].fieldValue('Fase',false,_arrRefs_[37]) < 4) 
														&& 
														(new Date(_arrRefs_[36].fieldValue('created')) < _arrRefs_[35])
													) 
										|| 
													/*Trabajo no Adelantado (wIssues) */
													(
																/*Trabajo de la UTE (wUTE)*/
																(
																	_arrRefs_[34].fieldValue('Proyecto.key') !='OT'
																)
														&&
														(new Date(_arrRefs_[33].fieldValue('created')) > _arrRefs_[32])
													)  
									)  
						&&
						(
						(_arrRefs_[31].fieldValue('Fase',false,_arrRefs_[30])) 
							== 
						(_arrRefs_[29].fieldValue('Fase',false,_arrRefs_[28]))
						) 
					)  )  
					(
					(_arrRefs_[27].fieldValue('Fase',false,_arrRefs_[26])) 
						< 
					(_arrRefs_[25].fieldValue('Fase',false,_arrRefs_[24]))
					) 
				)   ||  
				/*Trabajo sin cambio de Fase durante el periodo que ha reducido el tiempo trabajado acumulado (wReducidoTimespent)*/
				(  
					/*Trabajo de la Prorroga (wProrroga) */
					(
									/*Trabajo Adelantado (wAdvIssues)*/
									(
												/*Trabajo de la UTE (wUTE)*/
												(
													_arrRefs_[23].fieldValue('Proyecto.key') !='OT'
												) 
										&&
										(_arrRefs_[22].fieldValue('Fase',false,_arrRefs_[21]) < 4) 
										&& 
										(new Date(_arrRefs_[20].fieldValue('created')) < _arrRefs_[19])
									) 
						|| 
									/*Trabajo no Adelantado (wIssues) */
									(
												/*Trabajo de la UTE (wUTE)*/
												(
													_arrRefs_[18].fieldValue('Proyecto.key') !='OT'
												)
										&&
										(new Date(_arrRefs_[17].fieldValue('created')) > _arrRefs_[16])
									)  
					)  
					&& (
					/*Trabajo sin cambio de Fase durante el periodo (wMismaFase)*/
					(  
									/*Trabajo de la Prorroga (wProrroga) */
									(
													/*Trabajo Adelantado (wAdvIssues)*/
													(
																/*Trabajo de la UTE (wUTE)*/
																(
																	_arrRefs_[15].fieldValue('Proyecto.key') !='OT'
																) 
														&&
														(_arrRefs_[14].fieldValue('Fase',false,_arrRefs_[13]) < 4) 
														&& 
														(new Date(_arrRefs_[12].fieldValue('created')) < _arrRefs_[11])
													) 
										|| 
													/*Trabajo no Adelantado (wIssues) */
													(
																/*Trabajo de la UTE (wUTE)*/
																(
																	_arrRefs_[10].fieldValue('Proyecto.key') !='OT'
																)
														&&
														(new Date(_arrRefs_[9].fieldValue('created')) > _arrRefs_[8])
													)  
									)  
						&&
						(
						(_arrRefs_[7].fieldValue('Fase',false,_arrRefs_[6])) 
							== 
						(_arrRefs_[5].fieldValue('Fase',false,_arrRefs_[4]))
						) 
					)  ) 
					&&	(
					/*Tiempo Acumulado en hijos al final del periodo (childTimespentAtEnd)*/
					(
						_arrRefs_[3].fieldAccumChilds ('timespent',_arrRefs_[2])
					) < 
					/*Tiempo Acumulado en hijos al final del periodo (childTimespentAtEnd)*/
					(
						_arrRefs_[1].fieldAccumChilds ('timespent',_arrRefs_[0])
					)
					)
				)  )  
		;
	 return result;
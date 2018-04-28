class jrfReport{
	constructor(){
		var self=this;
		self.jqlRootIssues="id=BENT-330";
		self.rootIssues=["BENT-330"];
		self.billingHierarchyRules=`(child.linkValue('detecta')==parent.id)
		&&
		(child.fieldValue('fixVersions') /*Versión(es) Correctora(s)*/==parent.field('description') /*Descripción*/)
		||
		(child.fieldValue('project') /*Proyecto*/==parent.field('priority') /*Prioridad*/)`;
		self.advanceHierarchyRules=`(child.linkValue('bloquea a')==parent.id)
		||
		(child.fieldValue('customfield_11002') /*Ubicación*/==parent.field('customfield_11001') /*Tipo Seguimiento*/)`;
	}
	save(){
		
	}
	load(){
		
	}
	execute(){
		
	}
}
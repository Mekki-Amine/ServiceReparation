package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Utilisateur;

import java.util.List;


public interface Iuserr {

    public Utilisateur creatCompte (Utilisateur utilisateur) ;

    public List<Utilisateur> getAllUtilisateurs();
}

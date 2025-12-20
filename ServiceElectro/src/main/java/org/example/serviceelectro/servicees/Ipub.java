package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Publication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface Ipub {

    public List<Publication> getAllPublications() ;

    public Publication savePublication(Publication publication) ;

    public Publication getPublicationId(int id) ;




}
